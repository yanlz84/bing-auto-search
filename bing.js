// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.225
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["总书记时时牵挂人民", "王楚钦不敌张本智和 国乒丢冠", "陈幸同击败孙颖莎夺冠", "雨天行车注意“法拉第笼”效应", "秦岭失联约半个月的驴友找到了", "张本智和脱衣庆祝", "净网：编造地震虚假灾情？网警查处", "张本智和医疗暂停引争议", "社保新规来了 中小企业何去何从", "张本智和：王楚钦很强 不敢相信赢了", "陈幸同：没想到能赢孙颖莎", "抱怨没吃到鸡蛋男子：离婚 财产给她", "百果园卖个水果凭啥搞义务教育", "俄罗斯5名老太被收买成乌克兰杀手", "班主任性侵学生致其轻生 家属发声", "孙颖莎罕见3局都没过5分", "打工人又对食堂真香了", "90后北大教授创业2年吸金24亿", "巴勒斯坦男子拍下自己被枪杀瞬间", "张卫健回应演唱会掏出老年卡", "4楼开麻将馆3楼住户买震楼器反击", "女子为避雨进彩票店顺手刮中100万", "非婚生孩子不能领育儿补贴？没道理", "巴勒斯坦的“球王贝利”被以军炸死", "民宿内装了2个摄像头 游客交涉被怼", "婚内强奸案男方母亲跪求女方谅解", "河南一中学官方账号回复连发5质问", "大姨找人开锁说好50只给20还要讹500", "中科院博士辞职开民宿年营收400万", "今年“秋天第一杯奶茶”为何更火爆", "猥亵继女的上海民警一审获刑8年", "菲船只侵闯黄岩岛 中国海警回应", "“一把手”在上班时间外出打牌", "南宁一公司董事长仅17岁", "万达集团被强执超24亿", "450元1斤的蝉蜕被塞满泥土增重", "《南京照相馆》票房破22亿", "教培机构借暑期“贩卖焦虑”牟利", "单依纯演唱会哭成泪人 全场大喊歌王", "日本东京举行反靖国神社游行", "英军在亚太“秀肌肉”翻车了", "爸爸患糖尿病 女儿带其健身瘦了30斤", "谢霆锋演唱会观众中暑被120拉走", "日本车企每天损失2000万美元", "江苏被归类基孔肯雅热防控Ⅱ类地区", "67岁阿姨骑行20个国家：治好抑郁症", "美俄领导人宣布会晤 各自有何意图", "张本智和回应医疗暂停", "男子买80克黄金神色慌张 店员报警", "公厕下班前5分钟市民如厕被拒", "赵露思真被“资本”做局了吗"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
