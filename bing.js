// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.105
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
var default_search_words = ["贺信里的中非合作历史、当下和未来", "印度坠毁客机上242人全部遇难", "印度失事客机乘客国籍公布", "新潮商场发力青年消费", "印度坠毁客机划过居民区升起火球", "直击印度客机坠毁现场", "网警提醒：高考后考生家长仍需警惕", "演员王雷回应被称“西北捶王”", "印度坠机已致地面多人死亡", "两经济大省要共建一个50万人口新城", "打虎！国家铁路局局长费东斌被查", "重庆一车库有尸臭味？谣言", "印度客机机场坠毁 多人送医画面曝光", "印度坠毁客机型号为波音787-8", "中方回应特朗普称将对华征收55%关税", "印度客机坠毁是波音787首起空难", "小沈阳女儿出道照撞脸韩演员孔孝真", "阿里离职员工：很高兴马老师能够看到", "王晓晨回应与俞灏明已婚传闻：头昏了", "印度坠毁飞机尾部嵌在了楼房里", "印度坠机飞行员曾发出求救信号", "高考试卷真的是在监狱印刷的吗", "我驻印度使馆：坠毁客机无中国籍乘客", "印度外长发声", "父母殴打女儿出气：用刀刮 吊起来打", "印度航空坠机后波音股价下跌", "客机坠毁 印度民航部部长发声", "吴宣仪称月入3000时最快乐", "巴西小男孩骑“火箭猪”上学", "印度客机坠毁时油箱为满油状态", "波音公司回应印度坠机事件", "印度客机坠毁地点系医学院宿舍", "华人企业家成新西兰女首富", "众星发文力挺邓紫棋", "印度坠毁客机航班号为AI171", "男子被蝮蛇咬伤科学自救成功保命", "42岁百万网红“草帽姐”确诊肝病", "专家称印度坠毁飞机可能遭遇鸟击", "邓紫棋：超过六年没收到旧歌版税", "台风“蝴蝶”或将两次登陆我国", "印度坠毁客机起飞后坠入居民区", "华人亲历洛杉矶宵禁：怕挨枪子", "媒体称国足再弱也轮不到业余队挑战", "云南明确：这些公务活动一律不批准", "千万粉丝网红呼吁取消女厕马桶", "台网红“馆长”：台湾比上海差太多", "印度坠毁客机起飞后从雷达上消失", "白鹿贴脸开大于正：他话是不是有点多", "“洛杉矶之乱”将如何收场", "发长文的阿里离职员工已移居新西兰", "乌兹别克斯坦总统赠球员比亚迪汽车"]

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
