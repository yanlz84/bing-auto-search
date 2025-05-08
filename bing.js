// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.34
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
var default_search_words = ["去“三好”邻邦家做客", "央行1万亿元大红包对普通人影响多大", "拜登：特朗普太掉价了", "一文梳理这场国新办发布会", "两国禁止武契奇乘机飞越领空", "“始祖鸟平替”要IPO了", "巴总理激动拍桌：我们有实力有核力量", "牛弹琴：特朗普当场被怼了", "专家：中方同意与美接触不等于让步", "远隔万里的共同纪念", "降准降息对楼市影响有多大", "斗牛比赛现场冲突致人死亡？不实", "最先混进老年徒步团的已经进骨科了", "印军被曝在实控线附近升起白旗", "苟伟死因曝光 鼻息肉肥大致呼吸骤停", "到底谁为关税买单？美财长被问崩了", "全红婵老家盖别墅 无人机满天飞", "牛弹琴：印巴之战有3个“意料不到”", "特朗普号召美国民众勒紧裤腰带", "50多年来首次 印度大规模民防演习", "巴黎3-1阿森纳", "库里腿筋拉伤至少缺席一周", "“我不会跑 我是张纪中”", "牛弹琴：这次空战印度吃了大亏", "女子上门做饭每天6单月薪近2万", "邻居浇筑水泥冲垮墙面 女子新家被毁", "河南一老板制作铲子造型烧饼宠客", "台退将：解放军有实力让美军夜不能寐", "浙江广厦大比分0-1北京首钢", "戴维·珀杜宣誓就任美驻华大使", "泡泡玛特股份被创始股东高位清仓", "美国与胡塞武装都说对方退让", "三德子赵亮卖土鸡商标为“德子土”", "李冰冰于适手挽手出席活动", "中国代表呼吁共同捍卫二战胜利成果", "男大学生在宿舍给同学理发", "阿Sa回应容祖儿爆料其复合传闻", "法德领导人：合作应对欧洲面临的挑战", "胡塞武装称与美停火协议不涉及以方", "《刑警的日子》高亚麟被曝遭换脸", "印巴爆发全面战争的可能性有多大", "印巴冲突是否会进一步升级", "骑士G2冤死 裁判报告公布三次漏判", "榴莲即将进入旺季 价格将明显回落", "巴西央行如期加息50个基点", "曝马奎尔和霍伊伦因抢圈发生争执", "小米汽车回应前舱盖争议", "外商已开始到义乌抢圣诞用品了", "百威亚太第一季度净利润2.34亿美元", "韩国4月底外汇储备降至近年最低水平", "印度空军为何会遭遇耻辱性惨败"]

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
