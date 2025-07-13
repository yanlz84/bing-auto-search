// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.167
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
var default_search_words = ["发展海洋经济大有可为、大有前途", "王毅：南海问题上有个国家格格不入", "高考604分考生为了从军梦考上高职", "一份2025三伏天日历 请查收", "结婚1年离婚40万陪嫁被判为共同财产", "山东一地凌晨数十人蒙眼列队湖边走", "热热热！河南下周最高温度达44℃", "宋江别举铁了", "马斯克喊话特朗普：说了半天 公布得了", "目击者回应男子心肺复苏被指袭胸", "大连工业大学李同学全名可不被公告", "八旬老人往车前放死鸡碰瓷？误会", "#女学生出轨外国人被开除是否过重#", "失联高考生电话被自称缅甸人接听", "蔡国庆回应“怼19岁选手4分钟”争议", "中国女足4-2中国台北", "朝鲜谴责美日韩空中联合演习", "中国游客在泰国被掳走画面曝光", "#外卖大战最大的受害者出现了#", "俄外长拉夫罗夫抵达中国", "周深回应录制《奔跑吧》遭拖拽", "庞麦郎演唱会来了约400名听众", "俄罗斯考虑放弃唯一航母有啥隐情", "《扫毒风暴》首播口碑", "蔡国庆点评19岁选手怼了4分钟", "河南一炒米粉店后厨有庆大霉素药品", "12345回应侃爷上海演唱会提前退场", "小沈阳女儿机场被偶遇 超像妈妈", "有关俄与西方矛盾根源 普京最新表态", "外籍电竞选手Zeus会受到处罚吗", "游客在洪崖洞遭拉拽拍照 重庆通报", "伊朗总统曾遭以军暗杀受伤 细节曝光", "酒店回应客房浴巾有拆封的情趣用品", "印度外长将访华 要谈什么", "今年第5号台风“百合”生成", "#奶茶店人人人人外卖小哥被吓退#", "曹格17岁儿子晒照官宣恋情", "美公民在约旦河西岸被犹太定居者打死", "王楚钦张本智和男单争冠", "张本智和谈与王楚钦争冠：希望好运", "杜淳妻子王灿回应“二胎生儿子”", "吴艳妮为中国女篮加油", "金正恩游艇上会见拉夫罗夫 意味深长", "以民众发起大规模抗议示威", "日本殡仪馆因死者姓氏相同烧错遗体", "俄公布俄外长与金正恩会见更多细节", "加沙停火谈判陷僵局 以哈互相指责", "中方回应“中国军机异常接近日机”", "国足对阵日本现场观众仅1661人", "男孩尿女子衣服上家长还口出恶言", "王晶回忆梅艳芳传奇往事"]

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
