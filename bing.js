// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.226
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
var default_search_words = ["蓝天苍洱寄乡愁", "中美再次暂停实施相互24%关税90天", "C罗求婚乔治娜成功 两人已相恋9年", "一条地道如何打穿敌人防线", "特朗普宣布华盛顿特区进入紧急状态", "日本侵闯领海中方发射炮弹？官方回应", "网警双管齐下治理直播乱象", "胖东来货车司机休息室曝光", "中科院博士辞职开民宿年营收400万", "已有多位《中国好声音》歌手因病离世", "康师傅少卖了11亿：饮料方便面都在跌", "乌兰察布景区挖出黄金？当地回应", "为什么警察不帮我把被骗的钱追回来", "邓正安被开除党籍 取消退休待遇", "许昕评价张本智和医疗暂停", "牛弹琴：欧洲真急了", "墨总统强硬表态：绝不允许美军入境", "社保新规来了 中小企业何去何从", "张本智和夺冠后再与王皓握手", "烈性犬咬人致死 犬主应承担什么责任", "中方回应七国集团涉港错误声明", "中国稀土集团发布严正声明", "丈夫生下私生女妻子告重婚罪被驳回", "河南首富 越来越富", "东北雨姐账号将于10月解封", "香港多家超市汽水被注入尿液", "特朗普：见普京是“试探性会晤”", "67岁阿姨骑行20个国家：治好抑郁症", "间谍企图利用外卖员窃密 国安部披露", "未成年人骑“四座”共享电车被约谈", "可可西里无人区来了一只机器藏羚羊", "大姨找人开锁说好50只给20还要讹500", "娃哈哈回应砍掉年销300万以下经销商", "“专家”是否专业不重要 能带货就行", "美台谈判文件曝光为何震惊岛内", "中美斯德哥尔摩经贸会谈联合声明", "王楚钦主动向张本智和送上祝贺", "赵露思被问什么时候拍戏", "法国最大核电站因水母入侵导致停运", "泰国发现一具身份不明女尸", "事关反洗钱 央行等三部门征求意见", "国乒不能只靠王楚钦独挑大梁", "上海通报：建科董事陈为被查", "周鸿祎与机器人PK球技", "围殴中国留学生的嫌犯均被保释", "江苏被归类基孔肯雅热防控Ⅱ类地区", "特朗普：不会对进口黄金加征关税", "中国预警机加速迭代", "全球首个人形机器人运动会亮点", "中方回应“希望美放宽芯片出口”", "以色列总理称德国总理屈服了"]

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
